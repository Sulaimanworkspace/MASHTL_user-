import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const TermsConditions: React.FC = () => {
  const router = useRouter();
  const Container = View;
  const containerProps = {};

  return (
    <Container style={styles.container} {...containerProps}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />

      {/* Green Header Navigation Bar */}
      <View style={styles.navBar}>
        <LinearGradient
          colors={["#4CAF50", "#102811"]}
          style={styles.headerFade}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          pointerEvents="none"
        />
        <View style={styles.navContent}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/(tabs)/settings')}
        >
          <FontAwesome5 name="arrow-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>شروط وأحكام مشتل</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/images/icon.png')}
              style={styles.logo}
            />
          </View>
          <Text style={styles.heroTitle}>شروط مقدم الخدمات</Text>
          <Text style={styles.heroSubtitle}>تطبيق مشتل</Text>
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.introText}>
            شروط وأحكام التسجيل في تطبيق مشتل أو الموقع الإلكتروني والبدء باستخدامها
          </Text>

          <Text style={styles.paragraph}>
            يقوم تطبيق "مشتل" بجمع معلومات عنك عند استخدامك لتطبيقات الهاتف المحمول الخاصة بنا والمواقع الإلكترونية ومركز الاتصال ومنتجات وخدمات أخرى خاصة بنا (يشار إليها مجتمعة بـ "الخدمات") ومن خلال التفاعلات والاتصالات الأخرى الخاصة بك معنا. تنص سياسة الخصوصية هذه على الأساس الذي سوف تعتمد عليه مشتل في معالجة المعلومات بما في ذلك البيانات الشخصية التي نجمعها منك أو تزودها أنت لنا. في كل مرة تدخل فيها أو تستخدم الخدمات أو تزودنا بمعلومات، فإنك بقيامك بذلك تقبل وتوافق على الممارسات المبينة في سياسة الخصوصية هذه.
          </Text>

          <Text style={styles.paragraph}>
            يشار إلى ("المشتل"، "مزود الخدمة") سواء استفاد من خدمة التطبيق أو قام بالتسجيل على التطبيق فقط دون الموافقة على أي طلب وتمثل هذه الضوابط والشروط اتفاق رسمي "عقد" بين شركة مشتل للخدمات وتحكم شروط مقدم الخدمة هذه استخدامكم لتطبيق "مشتل" والذي هو عبارة عن منصة إلكترونية تسمح للمزارعين بتقديم خدمات للعملاء في منازلهم أو في المواقع يحددها العميل مسبقاً، حيث يقوم "مشتل" بإتاحة الفرصة للعميل لاختيار المزارع المناسب للقيام بعملية الصيانة.
          </Text>

          <Text style={styles.paragraph}>
            إن أي استخدام من قبلك للخدمات التي يوفرها تطبيق "مشتل" يشكل موافقة منك على هذا العقد وأحكامه وتبعاً لذلك يجب عليك عدم استخدام التطبيق في حال لم تكن موافقاً على الأحكام والشروط الواردة في هذا العقد.
          </Text>

          <Text style={styles.paragraph}>
            يجوز لتطبيق مشتل تعديل هذه الاتفاقية من حين لأخر وتسري التعديلات عقب نشر تطبيق مشتل للاتفاقية المحدثة على هذا الموقع او نشر السياسات المعدلة او الشروط التكميلية المتعلقة بالخدمة المقدمة وفي حال استمرارك لاستخدام التطبيق بعد نشر الاتفاقية يعد هذا موافقة منك على الالتزام بهذه الاتفاقية بصيغتها المعدلة.
          </Text>

          {/* Section: أحقية الحصول على الخدمات */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>أحقية الحصول على الخدمات</Text>
              <FontAwesome5 name="check-circle" size={20} color="#000000" />
            </View>
            <Text style={styles.paragraph}>
              أنت تقر وتضمن التالي:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>• أنه لم يسبق أن تم ايقاف استخدامك لخدمات "مشتل" أو منعك من استخدامها في اي وقت من الأوقات.</Text>
              <Text style={styles.bulletPoint}>• أنك لست منافساً ل"مشتل" كما أنك لا تقدم اي منتج منافس للخدمات المقدمة.</Text>
              <Text style={styles.bulletPoint}>• من اجل استخدام منصة "مشتل" يتعين ان يبلغ عمرك 18 عام على الأقل حتى يتسنى لك الحصول على حساب.</Text>
              <Text style={styles.bulletPoint}>• يتطلب تسجيل الحساب تقديم بعض المعلومات الشخصية الى شركة مشتل مثل (اسمك – عنوانك – رقم هاتفك –بيانات الكفيل –جنسك – رقم الهوية – تاريخ الميلاد).</Text>
              <Text style={styles.bulletPoint}>• ان يكون لديك (هوية – إقامة) نظامية سارية في المملكة العربية السعودية او ما يعادلها في الدول الأخرى.</Text>
              <Text style={styles.bulletPoint}>• إذا كنت تملك اقامة فانت تقر انها اقامة نظامية سارية وان المهنة التي تقدمها نفس المهنة الموجودة في الاقامة وفي حال اي تغيير يحدث يجب عليك تحديث معلوماتك لدينا وتقر بانك تعمل لدى كفيلك.</Text>
              <Text style={styles.bulletPoint}>• ليس لك أي حق في تقديم أي عروض للمستخدمين نيابة عن شركة مشتل، وأنت تقر بأن خرقك لهذا البند سوف يجعلك مسؤولا مسؤولية كاملة عن جميع الالتزامات الناشئة عن هذا الخرق ويعرضك للملاحقة الجنائية وحظر استخدامك للمنصة.</Text>
            </View>
          </View>

          {/* Section: التعهدات والضمانات */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>التعهدات والضمانات</Text>
              <FontAwesome5 name="shield-alt" size={20} color="#000000" />
            </View>
            <Text style={styles.paragraph}>
              أنت تقر بأنك سوف:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>• المحافظة على سمعة التطبيق "مشتل" واحترام العميل في المقام الأول.</Text>
              <Text style={styles.bulletPoint}>• الالتزام بتقديم الخدمة مباشرة فور استلامك للطلب والتواجد في موقع العميل بدون تأخير.</Text>
              <Text style={styles.bulletPoint}>• النظافة الشخصية واللبس اللائق للعمل.</Text>
              <Text style={styles.bulletPoint}>• وجود الأدوات الكاملة اللازمة لتقديم خدمة الصيانة المنزلية.</Text>
              <Text style={styles.bulletPoint}>• الكشف والمشوار مجانًا، ويمنع إضافة رسوم عليها.</Text>
              <Text style={styles.bulletPoint}>• تمتثل لكافة القوانين واللوائح المعمول بها في المملكة العربية السعودية.</Text>
              <Text style={styles.bulletPoint}>• قدم معلومات صحيحة ودقيقة إلى "شركة مشتل" وتقوم بتحديثها في حال طرأ أي تغيير.</Text>
              <Text style={styles.bulletPoint}>• تراجع وتمتثل لأي إشعارات يتم إرسالها من خلال تطبيق "مشتل" فيما يتعلق باستخدامك للخدمة المقدمة من تطبيق "مشتل".</Text>
              <Text style={styles.bulletPoint}>• لن تقوم بعمل تراخيص من الباطن، أو إصدار أو نشر أو نقل أو توزيع أو تنفيذ أو عرض أو بيع أو إعادة تصنيف خدمات "مشتل".</Text>
              <Text style={styles.bulletPoint}>• لن تستخدم المعلومات، أو المحتوى أو أي بيانات تصل إليها أو تحصل عليها من خلال خدمات "مشتل" في أي غرض آخر إلا للاستعمال الشخصي.</Text>
              <Text style={styles.bulletPoint}>• سوف تستخدم الخدمة أو التطبيق لأغراض مشروعة فقط، ولن تستخدم الخدمات لإرسال أو تخزين أي مواد غير قانونية أو بهدف الاحتيال.</Text>
              <Text style={styles.bulletPoint}>• تلتزم بالمحافظة على سلامة موقع العمل ونظافة المكان اثناء وبعد العمل.</Text>
              <Text style={styles.bulletPoint}>• لن تستخدم الخدمة أو التطبيق للتسبب بإيذاء أو مضايقة أو إزعاج أحد ما.</Text>
              <Text style={styles.bulletPoint}>• لن تعرقل التشغيل السليم لتطبيق "مشتل".</Text>
              <Text style={styles.bulletPoint}>• الالتزام بعدم التواصل مع العميل بعد (اكتمال أو الغاء الطلب) وهذا يعرضك للمساءلة القانونية وإيقاف حسابك دون الرجوع إليك.</Text>
              <Text style={styles.bulletPoint}>• لن تحاول إلحاق الضرر بالخدمة أو التطبيق بأي شكل من الأشكال.</Text>
              <Text style={styles.bulletPoint}>• لن تنسخ أو توزع التطبيق أو المحتويات الأخرى دون الحصول على إذن كتابي من "مشتل".</Text>
              <Text style={styles.bulletPoint}>• سوف تحافظ على كلمة المرور لحسابك أو أي وسيلة تعريف نقدمها لك وتتيح الدخول إلى حسابك، بشكلٍ آمن وسري.</Text>
              <Text style={styles.bulletPoint}>• سوف تقدم لنا كافة الدلائل التي تثبت هويتك وفقاً لتقدير "مشتل" الخاص.</Text>
              <Text style={styles.bulletPoint}>• يحق لـ"مشتل" رفض تقديم الخدمة أو استخدام التطبيق دون إبداء أسباب.</Text>
              <Text style={styles.bulletPoint}>• الالتزام بالأسعار المحددة داخل التطبيق، وفي حال وجود أي أعمال أخرى لا تشملها قائمة الأسعار يجب الالتزام بالسعر العادل.</Text>
              <Text style={styles.bulletPoint}>• يتوجب عليك الالتزام بالعمل ضمن فترات العروض، ورفضها يعرضك لاتخاذ إجراء بحقك قد يصل إلى إيقاف حسابك دون الرجوع إليك.</Text>
              <Text style={styles.bulletPoint}>• تقر بانك لن تقوم بعمل طلبات او تقييمات وهمية.</Text>
            </View>
          </View>

          {/* Section: الدفع */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>الدفع</Text>
              <FontAwesome5 name="credit-card" size={20} color="#000000" />
            </View>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>• لـ"مشتل" الحق بفرض رسوم جديدة على استخدام التطبيق او الخدمة او كليهما.</Text>
              <Text style={styles.bulletPoint}>• لا يجوز لمزود الخدمة المطالبة باي مبالغ تم شحنها في رصيده او أي اشتراكات داخل التطبيق.</Text>
              <Text style={styles.bulletPoint}>• في حال تم تغيير الرسوم او النسبة فإنة سيتم اشعارك بذلك ويمكنك الاستمرار او الغاء الحساب.</Text>
              <Text style={styles.bulletPoint}>• تقوم "مشتل" بتحديد نسبة العمولة الخاصة بـ ("مزود الخدمة"، "مشتل") ويتم تحصيلها من المزارع وفق ما يتطلبه السوق.</Text>
              <Text style={styles.bulletPoint}>• يجوز ل"مشتل" تعديل أو تحديث الأسعار من وقت لآخر، وتكون مسؤول مسؤولية كاملة عن البقاء على معرفة بالأسعار الحالية لخدمة الصيانة.</Text>
              <Text style={styles.bulletPoint}>• يجوز ل"مشتل" الغاء الاشتراك وشطب الحساب نهائيا وخصم الرصيد بالحساب عند عدم استخدامك ل"مشتل" ما يتعدى 45 يوم من اخر استخدام.</Text>
              <Text style={styles.bulletPoint}>• يتوجب عليك القبول بأي عروض أو خصومات عند الإعلان عنها وعندما يقوم العميل باستخدام كود خصم في الطلب.</Text>
              <Text style={styles.bulletPoint}>• يتوجب عليك استلام قيمة خدمة الصيانة من العميل النهائي نقداً – اونلاين، وفور تقديم الخدمة، وتتحمل وحدك مسؤولية عدم استلام قيمة خدمة الصيانة.</Text>
              <Text style={styles.bulletPoint}>• لا يجوز لمزود الخدمة اجبار العميل على طريقة الدفع.</Text>
            </View>
          </View>

          {/* Section: المسؤولية القانونية */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>المسؤولية القانونية</Text>
              <FontAwesome5 name="gavel" size={20} color="#000000" />
            </View>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>• المعلومات والتوصيات والخدمات أو أي منها التي قُدمت لك على أو من خلال موقع الويب والخدمة والتطبيق هي لأغراض المعلومات العامة فقط ولا تمثل أي نصيحة.</Text>
              <Text style={styles.bulletPoint}>• ستحافظ "مشتل" قدر الإمكان على صحة وتحديث الموقع والتطبيق ومحتوياته، لكنها لا تضمن أن (محتويات) الموقع أو التطبيق خالية من الأخطاء والعيوب والبرامج الضارة والفيروسات.</Text>
              <Text style={styles.bulletPoint}>• لا يتحمل "مشتل" المسؤولية عن أي أضرار تنتج عن استخدام (أو عدم القدرة على استخدام) الموقع أو التطبيق، بما في ذلك الأضرار التي تسببها البرامج الضارة أو الفيروسات.</Text>
              <Text style={styles.bulletPoint}>• تقع مسؤولية جودة خدمة الصيانة المطلوبة باستخدام التطبيق أو الخدمة بأكملها عليك، ولا يتحمل "مشتل" أي مسؤولية في هذا الجانب.</Text>
              <Text style={styles.bulletPoint}>• لا يقبل "مشتل" تحت أي ظرف من الظروف أي مسؤولية تتعلق بخدمات الصيانة التي يقدمها مزود الخدمة أو تنشأ عنها بعد انتهاء.</Text>
              <Text style={styles.bulletPoint}>• "مشتل" غير مسؤول عن أي أفعال أو تصرفات أو سلوك أو إهمال، أو جميع ما سبق، من جانب مزود خدمة الصيانة.</Text>
              <Text style={styles.bulletPoint}>• إن أي شكاوى بشأن خدمات الصيانة تقدم من قبل العملاء، ينبغي تقديمها لـ"تطبيق مشتل" بشكل مباشر، على أن "مشتل" لا يتحمل أي مسؤولية في هذا الجانب، ويكون فقط حلقة وصل بين الطرفين.</Text>
              <Text style={styles.bulletPoint}>• لـ"مشتل" الحق في تقديم أي معلومات للجهات الرسمية في حال طلب منها ذلك.</Text>
            </View>
          </View>

          {/* Section: مدة العقد وإنهاؤه */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>مدة العقد وإنهاؤه</Text>
              <FontAwesome5 name="clock" size={20} color="#000000" />
            </View>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>• يكون العقد المُبرم بينك وبين "شركة مشتل" غير محدد المدة. ويحق لك إنهاء العقد في أي وقت بحذف التطبيق المُثبّت على هاتفك الذكي حذفًا نهائيًا.</Text>
              <Text style={styles.bulletPoint}>• يحق ل"مشتل" إنهاء العقد بأثر فوري في أي وقت (بتعطيل استخدامك للتطبيق والخدمة)، وذلك في حالة قيامك بأي مما يلي:</Text>
              <Text style={styles.bulletPoint}>  - عدم الالتزام بأي شرط من شروط مقدم الخدمة.</Text>
              <Text style={styles.bulletPoint}>  - في حال اساءتك استخدام التطبيق أو الخدمة.</Text>
              <Text style={styles.bulletPoint}>• ومشتل الحق في انهاء العقد بدون اخبارك بإنهاء العقد.</Text>
            </View>
          </View>

          {/* Section: القانون المعمول به */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>القانون المعمول به وحل النزاعات</Text>
              <FontAwesome5 name="balance-scale" size={20} color="#000000" />
            </View>
            <Text style={styles.paragraph}>
              تخضع شروط مقدم الخدمة الماثلة ويطبق على تسوية أي نزاع أو مطالبة أو خلاف ينشأ عن شروط مقدم الخدمة الماثلة أو يتعلق بها أو أي انتهاك لها أو إنهائها أو تنفيذها أو تفسيرها أو صحتها أو استخدام الموقع أو الخدمة أو التطبيق، للقوانين والأنظمة المطبقة في المملكة العربية السعودية وتفسر وفقا لها.
            </Text>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  navBar: {
    paddingTop: Platform.OS === 'android' ? 20 : 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  headerFade: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  navContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    right: 0,
    padding: 8,
    zIndex: 1,
    top: 0,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 16,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  introText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 26,
  },
  section: {
    marginTop: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'flex-end',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginRight: 5,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#34495e',
    textAlign: 'right',
    marginBottom: 16,
  },
  bulletList: {
    marginTop: 8,
  },
  bulletPoint: {
    fontSize: 15,
    lineHeight: 22,
    color: '#34495e',
    textAlign: 'right',
    marginBottom: 8,
    paddingRight: 8,
  },
});

export default TermsConditions;
