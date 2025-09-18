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
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const UserAgreement: React.FC = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
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
            <Text style={styles.headerTitle}>اتفاقية استخدام البرنامج</Text>
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
          <Text style={styles.heroTitle}>اتفاقية العملاء</Text>
          <Text style={styles.heroSubtitle}>تطبيق مشتل</Text>
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.introText}>
            اتفاقية العملاء في تطبيق مشتل أو الموقع الإلكتروني والبدء باستخدامها
          </Text>

          <Text style={styles.paragraph}>
            تقوم شركة مشتل / أو الشركات التابعة لها (يشار إليها مجتمعة بـ "مشتل"، "نحن"، أو "التطبيق") بجمع معلومات عنك عند استخدامك لتطبيقات الهاتف المحمول الخاصة بنا والمواقع الإلكترونية ومركز الاتصال ومنتجات وخدمات أخرى خاصة بنا (يشار إليها مجتمعة بـ "الخدمات") ومن خلال التفاعلات والاتصالات الأخرى الخاصة بك معنا.
          </Text>

          <Text style={styles.paragraph}>
            تنص سياسة الخصوصية هذه على الأساس الذي سوف تعتمد عليه مشتل في معالجة المعلومات بما في ذلك البيانات الشخصية التي نجمعها منك أو تزودها أنت لنا. في كل مرة تدخل فيها أو تستخدم الخدمات أو تزودنا بمعلومات، فإنك بقيامك بذلك تقبل وتوافق على الممارسات المبينة في سياسة الخصوصية هذه.
          </Text>

          <Text style={styles.paragraph}>
            يشار إلى ("المستخدمين"، "العميل") العميل سواء استفاد من خدمة التطبيق أو قام بالتسجيل على التطبيق فقط دون إجراء أي طلب. كما يشار إلى "الفني" أو "مزود الخدمة" الذي يقدم خدمات التطبيق. ويشار إلى "العميل" الذي استفاد من خدمة التطبيق أو قام بالطلب مرة واحدة على الأقل.
          </Text>

          {/* Section: سياسة الخصوصية */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>سياسة الخصوصية</Text>
              <FontAwesome5 name="shield-alt" size={20} color="#000000" />
            </View>
            <Text style={styles.paragraph}>
              عميلنا العزيز أنت بإتمامك عملية التسجيل توافق على هذه الشروط والأحكام وتوافق على سياسة الخصوصية في جمع واستخدام البيانات الخاصة بك المسجلة على تطبيق فني أو الموقع الالكتروني أو أي طرف ثالث من مقدمي الخدمة سواءً قمت بالاطلاع عليها أو تخطيتها في خطوات التسجيل.
            </Text>
          </View>

          {/* Section: جمع المعلومات */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>جمع المعلومات</Text>
              <FontAwesome5 name="info-circle" size={20} color="#000000" />
            </View>
            <Text style={styles.paragraph}>
              نحن نقوم بجمع المعلومات التي تقدمها لنا مباشرة من خلال وصولك أو استخدام للخدمات، مثلا، عندما تقوم بإنشاء أو تعديل الحساب الخاص بك، أو طلب خدمة، أو الاتصال بمركز العناية بالعملاء أو الاتصال بنا بطرق أخرى.
            </Text>
            <Text style={styles.paragraph}>
              يمكن أن تتضمن هذه المعلومات: اسمك، تاريخ ميلادك، البريد الإلكتروني، رقم الجوال أو الهاتف، العنوان البريدي، صورة الملف الشخصي، طريقة الدفع، البيانات المالية ومعلومات بطاقة الائتمان، وأي معلومات أخرى تختار تقديمها لنا.
            </Text>
            <Text style={styles.paragraph}>
              لا نتعمد جمع المعلومات الشخصية من الأطفال ما دون سن 18 أو الاحتفاظ بها أو حفظها من خلال الخدمات، حيث أننا نطلب بأن يتعهد جميع المستخدمين لنا بأن عمرهم لا يقل عن 18 سنة.
            </Text>
          </View>

          {/* Section: معلومات نقوم بجمعها من خلال استخدامك لخدماتنا */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>معلومات نقوم بجمعها من خلال استخدامك لخدماتنا</Text>
              <FontAwesome5 name="database" size={20} color="#000000" />
            </View>
            <Text style={styles.paragraph}>
              عندما تقوم باستخدام خدماتنا، نقوم بجمع معلومات (أي معلومات يمكن استخدامها للاتصال بك مباشرة مثل الاسم الكامل والعنوان البريدي ورقم الهاتف ومعلومات بطاقة الائتمان/ الخصم، أو عنوان البريد الإلكتروني) ("المعلومات الشخصية") والمعلومات الديموغرافية.
            </Text>
            <Text style={styles.paragraph}>
              كما نستخدم أيضا تقنية نظام تحديد المواقع (GPS) لتحديد موقعك الحالي. بعض الخدمات الخاصة بنا التي تطلب مشاركة الموقع تطلب بياناتك الشخصية للعمل في المستقبل. إذا كنت ترغب باستخدام خاصية معينة، سوف يطلب منك الموافقة على البيانات التي يجري استخدامها لهذا الغرض.
            </Text>
          </View>

          {/* Section: استخدام البيانات الشخصية */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>استخدام البيانات الشخصية</Text>
              <FontAwesome5 name="cogs" size={20} color="#000000" />
            </View>
            <Text style={styles.paragraph}>
              يمكننا استخدام المعلومات الشخصية التي تزودنا بها التي نجمعها منك للأغراض التالية:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>• تزويد وصيانة وتحسين خدماتنا، يشمل ذلك على سبيل المثال، تسهيل طرق الدفع وإرسال الإيصالات وتقديم المنتجات والخدمات التي تطلبها.</Text>
              <Text style={styles.bulletPoint}>• أداء العمليات والإدارة الداخلية، يشمل ذلك، على سبيل المثال، منع الاحتيال وإساءة استخدام خدماتنا، واستكشاف أخطاء البرمجيات وحلولها والمشاكل التشغيلية.</Text>
              <Text style={styles.bulletPoint}>• إرسال أو تسهيل الاتصالات بينك وبين مزود الخدمة، مثل الأوقات المقدرة للوصول (ETAs).</Text>
              <Text style={styles.bulletPoint}>• إرسال معلومات لك نرى بأنها ذات أهمية بالنسبة لك، يشمل ذلك معلومات حول منتجات وخدمات مشتل والعروض الترويجية والأخبار والأحداث الخاصة بمشتل.</Text>
              <Text style={styles.bulletPoint}>• إشعارك بشأن التغيرات على خدماتنا.</Text>
              <Text style={styles.bulletPoint}>• السماح لك بالمشاركة في ميزات تفاعلية لخدماتنا.</Text>
              <Text style={styles.bulletPoint}>• الحفاظ على خدماتنا آمنة ومؤمنة.</Text>
              <Text style={styles.bulletPoint}>• تخصيص وتحسين الخدمات، يشمل ذلك تقديم الميزات أو التوصية بها والمحتوى والاتصالات الاجتماعية والإحالات والإعلانات.</Text>
            </View>
          </View>

          {/* Section: مشاركة البيانات الشخصية */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>مشاركة البيانات الشخصية</Text>
              <FontAwesome5 name="share-alt" size={20} color="#000000" />
            </View>
            <Text style={styles.paragraph}>
              ربما نقوم بمشاركة البيانات الشخصية التي نجمعها عنك كما هو موضح في هذا البيان أو كما هو موضح في وقت جمع المعلومات أو مشاركتها، يشمل ذلك ما يلي:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>• مع مزود الخدمة عند تقديم الخدمات التي تطلبها. على سبيل المثال، نقوم بمشاركة اسمك ورقم جوالك وموقع تقديم الخدمة مع مزود الخدمة.</Text>
              <Text style={styles.bulletPoint}>• مع أطراف ثالثة لتقديم خدمة قمتم بطلبها من خلال شراكة أو عرض ترويجي مقدم بواسطة طرف ثالث أو بواسطتنا.</Text>
              <Text style={styles.bulletPoint}>• مع أطراف ثالثة تختار أنت السماح لنا بمشاركة البيانات الشخصية الخاصة بك معها.</Text>
              <Text style={styles.bulletPoint}>• مع جهة العمل الخاصة بك وأي أطراف ثالثة لازمة مشاركة بواسطتنا أو بواسطة جهة العمل الخاصة بكم، إذا كنت مشاركاً في أي من الحلول المؤسسية الخاصة بنا.</Text>
            </View>
          </View>

          {/* Section: شروط استخدام تطبيق مشتل */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>شروط استخدام تطبيق مشتل</Text>
              <FontAwesome5 name="file-contract" size={20} color="#000000" />
            </View>
            <Text style={styles.paragraph}>
              عميلنا العزيز أنت بإتمامك عملية التسجيل توافق على هذه الشروط والأحكام وتوافق على سياسة الخصوصية في جمع واستخدام البيانات الخاصة بك المسجلة على تطبيق مشتل أو الموقع الالكتروني أو أي طرف ثالث من مقدمي الخدمة سواءً قمت بالاطلاع عليها أو تخطيتها في خطوات التسجيل.
            </Text>
          </View>

          {/* Section: تقديم الخدمة */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>تقديم الخدمة</Text>
              <FontAwesome5 name="handshake" size={20} color="#000000" />
            </View>
            <Text style={styles.paragraph}>
              "تطبيق مشتل" هو منصة الكترونية تجمع بين "العميل" و "مزود الخدمة" لتقديم خدمات الصيانة المنزلية الزراعية للعميل في الموقع الذي يحدده؛ حيث يقوم العميل باختيار المزارع المناسب له لعمل الصيانة المطلوبة او يقوم "التطبيق" بترشيح مزود خدمة مناسب.
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>• سوف يتم مشاركة بعض معلوماتك لمزود الخدمة حسب الحاجة إليها ومن ذلك موقعك ورقم جوالك ويجب عليك الاتفاق مع الفني على الاعمال المطلوبة قبل بدء عمل مزود الخدمة.</Text>
              <Text style={styles.bulletPoint}>• في حال تم إيقاف مزود الخدمة عن العمل لأي سبب كان يتحمل العميل تكاليف الاعمال المنجزة وسعر قطع الغيار التي وفرها مزود الخدمة دون أدنى مسئولية من "التطبيق".</Text>
              <Text style={styles.bulletPoint}>• نخلي مسؤوليتنا عن أي تواصل بين العميل والفني بعد انتهاء الخدمة المقدمة.</Text>
              <Text style={styles.bulletPoint}>• في حال تم الغاء طلب الخدمة لأي سبب كان، وبعد ذلك تم الاستفادة من الخدمة يجب على العميل التواصل معنا لتعديل حالة الطلب خلال 24 ساعة.</Text>
              <Text style={styles.bulletPoint}>• العميل يعتبر مسؤول مسؤولية كاملة عما يتم بينه وبين مزود الخدمة ونخلي مسؤوليتنا عن أي خلاف قد ينشب بين الطرفين.</Text>
            </View>
          </View>

          {/* Section: التقديم */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>التقديم</Text>
              <FontAwesome5 name="money-bill-wave" size={20} color="#000000" />
            </View>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>• لا توجد أي رسوم إضافية على الخدمة.</Text>
              <Text style={styles.bulletPoint}>• فاتورة الخدمة تشمل (تكلفة عمل "مزود الخدمة"، وتكلفة قطع الغيار التي يوفرها "مزود الخدمة" إن وجدت، بالإضافة لضريبة القيمة المضافة 5%).</Text>
              <Text style={styles.bulletPoint}>• يجب عليك الموافقة على الفاتورة التي يصدرها مزود الخدمة قبل بدء العمل المتفق عليه والدفع لمزود الخدمة مباشرة حسب المبلغ المتفق عليه والمطابق للفاتورة.</Text>
              <Text style={styles.bulletPoint}>• يحق للعميل رفض الفاتورة في حال كان المبلغ المتفق عليه غير مطابق للمبلغ المسجل على الفاتورة.</Text>
              <Text style={styles.bulletPoint}>• ضريبة الخدمة المضافة (5%) على اجمالي تكلفة عمل اليد فقط، وهي الزامية على المستهلك النهائي ولا يتحمل التطبيق أو "مزود الخدمة" دفعها.</Text>
              <Text style={styles.bulletPoint}>• في حال عدم تسديدك للمبلغ كاملاً؛ يحق لتطبيق "مشتل" إيقاف حسابك واتخاذ الإجراءات النظامية بحقك.</Text>
            </View>
          </View>

          {/* Section: ايقاف الخدمة */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>ايقاف الخدمة</Text>
              <FontAwesome5 name="ban" size={20} color="#000000" />
            </View>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>• يحق لمشتل إيقاف أي حساب يحاول العبث أو التحايل في العمليات أو الإضرار بأحد الأطراف.</Text>
              <Text style={styles.bulletPoint}>• يحق لمشتل حظر حساب "العميل" في حال عدم دفع القيمة المتفق عليها مع "مزود الخدمة".</Text>
              <Text style={styles.bulletPoint}>• يحق لمشتل إيقاف حساب "العميل" ورفض تقديم الخدمة دون ابداء أي أسباب.</Text>
            </View>
          </View>

          {/* Section: حقوق الطبع */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>حقوق الطبع</Text>
              <FontAwesome5 name="copyright" size={20} color="#000000" />
            </View>
            <Text style={styles.paragraph}>
              يعتبر المحتوى، الموجود في تطبيق مشتل او موقع مشتل ملك لشركة فمشتل للخدمات التجارية ويمنع منعاً مطلقاً نسخ، إعادة توزيع، استخدام، أو طبع أي من هذه المواد أو أي جزء منها من "الموقع" أو من أية مواقع أخرى، إلا في الحدود التي تسمح بها القوانين السارية في المملكة العربية السعودية في هذا الشأن.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  navBar: {
    paddingTop: 50,
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
    textAlign: 'right',
    flex: 1,
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

export default UserAgreement;
